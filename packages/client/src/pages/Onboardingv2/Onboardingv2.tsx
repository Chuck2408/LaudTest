import { useTracker } from "@laudspeaker/react";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useInterval } from "react-use";
import OnboardingSandbox, { SandboxStep } from "./OnboardingSandbox";
import SelectCustomers from "./SelectCustomers";
import StartJourney from "./StartJourney";
import OnboardingStepper from "./Stepper/OnboardingStepper";
import buildJourneysImage from "./svg/build-journeys.svg";
import segmentCustomersImage from "./svg/segment-customers.svg";
import trackMetricsImage from "./svg/track-metrics.svg";
import TrackPerformance from "./TrackPerformance";

export enum OnboardingPage {
  CREATE_JOURNEY,
  SELECT_CUSTOMERS,
  START_JOURNEY,
  TRACK_PERFORMANCE,
}

export const onboardingStepToNameMap: Record<OnboardingPage, string> = {
  [OnboardingPage.CREATE_JOURNEY]: "Create a journey",
  [OnboardingPage.SELECT_CUSTOMERS]: "Select Customers",
  [OnboardingPage.START_JOURNEY]: "Start the Journey",
  [OnboardingPage.TRACK_PERFORMANCE]: "Track performance",
};

const Onboardingv2 = () => {
  const { state: trackerState, emitTrackerEvent } = useTracker<{
    step: SandboxStep;
    page: OnboardingPage;
  }>("tracker_id");

  const currentPage = trackerState?.page;
  const currentStep = trackerState?.step;

  const [renderFirstStep, setRenderFirstStep] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!renderFirstStep) return;

    emitTrackerEvent("show-first-page");
    setRenderFirstStep(false);
  }, [renderFirstStep]);

  useInterval(() => {
    if (!buttonRef.current || currentPage !== undefined) return;

    setShowScrollButton(
      buttonRef.current.offsetTop +
        buttonRef.current.clientHeight -
        window.scrollY >
        window.innerHeight
    );
  }, 100);

  const stepComponentMap: Record<OnboardingPage, ReactNode> = {
    [OnboardingPage.CREATE_JOURNEY]: (
      <OnboardingSandbox
        onSandboxComplete={() => emitTrackerEvent("show-customers-page")}
        currentStep={currentStep}
        emitTrackerEvent={emitTrackerEvent}
      />
    ),
    [OnboardingPage.SELECT_CUSTOMERS]: (
      <SelectCustomers
        onSendEmailClick={() => emitTrackerEvent("show-start-journey-page")}
      />
    ),
    [OnboardingPage.START_JOURNEY]: (
      <StartJourney
        onStartClick={() => emitTrackerEvent("show-track-performance-page")}
      />
    ),
    [OnboardingPage.TRACK_PERFORMANCE]: <TrackPerformance />,
  };

  return currentPage !== undefined && !renderFirstStep ? (
    <div
      className={`min-h-screen h-screen flex flex-col gap-[20px] p-[20px] font-inter text-[16px] font-normal text-[#111827] leading-[24px] ${
        currentPage === OnboardingPage.SELECT_CUSTOMERS
          ? "bg-[#F9FAFB]"
          : "bg-white"
      }`}
    >
      <div className="flex justify-between px-[20px] pt-[20px]">
        <button
          className={`underline text-black font-inter font-normal text-[16px] leading-[24px] ${
            currentPage === OnboardingPage.TRACK_PERFORMANCE
              ? "opacity-0 pointer-events-none"
              : ""
          }`}
          onClick={
            currentPage === OnboardingPage.CREATE_JOURNEY
              ? () => {
                  emitTrackerEvent("reset");
                  setRenderFirstStep(true);
                }
              : () =>
                  emitTrackerEvent(
                    currentPage === OnboardingPage.SELECT_CUSTOMERS
                      ? "show-create-journey-page"
                      : "show-customers-page"
                  )
          }
        >
          {currentPage === OnboardingPage.CREATE_JOURNEY ? "Reset" : "Back"}
        </button>

        <OnboardingStepper currentStep={currentPage} />

        <button onClick={() => window.history.back()}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 30L30 2M2 2L30 30"
              stroke="#111827"
              strokeWidth="3.375"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {stepComponentMap[currentPage]}
    </div>
  ) : (
    <div className="bg-white w-full min-h-screen p-[60px] flex justify-center text-justify">
      <div className="max-w-[1440px]">
        <button
          className="fixed top-[40px] right-[40px]"
          onClick={() => window.history.back()}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 30L30 2M2 2L30 30"
              stroke="#111827"
              strokeWidth="3.375"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {showScrollButton && (
          <button
            className="fixed bottom-[94px] right-[60px]"
            onClick={() =>
              buttonRef.current &&
              window.scrollTo({
                top:
                  buttonRef.current.offsetTop - buttonRef.current.clientHeight,
              })
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="55"
              height="48"
              viewBox="0 0 55 48"
              fill="none"
            >
              <path
                d="M44.6875 10.5L27.5 25.5L10.3125 10.5M44.6875 22.5L27.5 37.5L10.3125 22.5"
                stroke="#4B5563"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="mt-[44px] text-black text-[56px] font-inter font-semibold leading-[68px] flex justify-center">
          Unleash Your Messaging Potential
        </div>

        <div className="mt-[40px] flex justify-center items-center gap-[40px]">
          <div className="rounded-[25px] w-full">
            <img src={buildJourneysImage} />
          </div>
          <div className="rounded-[25px] w-full">
            <img src={segmentCustomersImage} />
          </div>
          <div className="rounded-[25px] w-full">
            <img src={trackMetricsImage} />
          </div>
        </div>

        <div className="mt-[40px] flex items-center justify-center">
          Let us guide you to maximize our platform's features
        </div>

        <div className="mt-[40px] flex items-center justify-center">
          <button
            className="px-[30px] py-[10px] rounded-[30px] bg-[#6366F1] flex items-center justify-center text-white"
            onClick={() => {
              emitTrackerEvent("onboarding-start");
            }}
            ref={buttonRef}
          >
            Let's start
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboardingv2;
