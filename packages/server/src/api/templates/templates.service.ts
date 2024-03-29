import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../accounts/entities/accounts.entity';
import { CustomersService } from '../customers/customers.service';
import { CustomerDocument } from '../customers/schemas/customer.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Installation } from '../slack/entities/installation.entity';
import { SlackService } from '../slack/slack.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { EventDto } from '../events/dto/event.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Template)
    private templatesRepository: Repository<Template>,
    @Inject(CustomersService) private customersService: CustomersService,
    @Inject(SlackService) private slackService: SlackService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('slack') private readonly slackQueue: Queue
  ) {}

  create(account: Account, createTemplateDto: CreateTemplateDto) {
    const template = new Template();
    template.type = createTemplateDto.type;
    template.name = createTemplateDto.name;
    template.ownerId = (<Account>account).id;
    switch (template.type) {
      case 'email':
        template.subject = createTemplateDto.subject;
        template.text = createTemplateDto.text;
        template.style = createTemplateDto.style;
        break;
      case 'slack':
        template.slackMessage = createTemplateDto.slackMessage;
        break;
      case 'sms':
        break;
      //TODO
    }
    return this.templatesRepository.save(template);
  }

  /**
   * Queues a message up to be sent to a customer using a template.
   *
   *  @remarks
   * If either the customer is not found or the template is not found
   * this will return an error.
   *
   * @param account - The owner of the audience
   * @param templateId - ID of template to send
   * @param customerId - ID of customer to send to
   *
   */
  async queueMessage(
    account: Account,
    templateId: string,
    customerId: string,
    event: EventDto,
    audienceId?: string
  ): Promise<string | number> {
    let customer: CustomerDocument,
      template: Template,
      job: Job<any>, // created jobId
      installation: Installation;
    try {
      customer = await this.customersService.findById(account, customerId);
    } catch (err) {
      return Promise.reject(err);
    }
    try {
      template = await this.findOneById(account, templateId);
      this.logger.debug(
        'Found template: ' + template.id + ' of type ' + template.type
      );
    } catch (err) {
      return Promise.reject(err);
    }
    const { _id, ownerId, audiences, ...tags } = customer.toObject();
    switch (template.type) {
      case 'email':
        job = await this.emailQueue.add('send', {
          key: account.mailgunAPIKey,
          from: account.sendingName,
          domain: account.sendingDomain,
          email: account.sendingEmail,
          to: customer.phEmail ? customer.phEmail : customer.email,
          audienceId,
          customerId,
          tags,
          subject: template.subject,
          text: event?.payload ? event.payload : template.text,
        });
        break;
      case 'slack':
        try {
          installation = await this.slackService.getInstallation(customer);
        } catch (err) {
          return Promise.reject(err);
        }
        job = await this.slackQueue.add('send', {
          methodName: 'chat.postMessage',
          token: installation.installation.bot.token,
          args: {
            channel: customer.slackId,
            text: event?.payload ? event.payload : template.slackMessage,
            tags,
          },
        });
        break;
      case 'sms':
        break;
    }
    return Promise.resolve(job.id);
  }

  async findAll(
    account: Account,
    take = 100,
    skip = 0,
    orderBy?: keyof Template,
    orderType?: 'asc' | 'desc'
  ): Promise<{ data: Template[]; totalPages: number }> {
    const totalPages = Math.ceil(
      (await this.templatesRepository.count({
        where: { ownerId: (<Account>account).id },
      })) / take || 1
    );
    const orderOptions = {};
    if (orderBy && orderType) {
      orderOptions[orderBy] = orderType;
    }
    const templates = await this.templatesRepository.find({
      where: { ownerId: (<Account>account).id },
      order: orderOptions,
      take: take < 100 ? take : 100,
      skip,
    });
    return { data: templates, totalPages };
  }

  findOne(account: Account, name: string): Promise<Template> {
    return this.templatesRepository.findOneBy({
      ownerId: (<Account>account).id,
      name: name,
    });
  }

  findOneById(account: Account, id: string): Promise<Template> {
    return this.templatesRepository.findOneBy({
      ownerId: (<Account>account).id,
      id: id,
    });
  }

  findBy(
    account: Account,
    type: 'email' | 'slack' | 'sms'
  ): Promise<Template[]> {
    return this.templatesRepository.findBy({
      ownerId: (<Account>account).id,
      type: type,
    });
  }

  update(account: Account, name: string, updateTemplateDto: UpdateTemplateDto) {
    return this.templatesRepository.update(
      { ownerId: (<Account>account).id, name: name },
      { ...updateTemplateDto }
    );
  }

  async remove(account: Account, name: string): Promise<void> {
    await this.templatesRepository.delete({
      ownerId: (<Account>account).id,
      name,
    });
  }
}
