"use client";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    title: "Attest",
    description: "Generate a cryptographic attestation for your compliance claims",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
    ),
    title: "Disclose",
    description: "Choose which claims to share with time-limited, secure links",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    title: "Verify",
    description: "Auditors verify cryptographically without seeing personal data",
  },
];

/**
 * JourneySteps - Horizontal stepper showing the 3-step VeilPass flow
 * Helps users understand the process before starting
 */
export function JourneySteps() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between relative">
        {/* Connecting line - positioned behind the step circles */}
        <div
          className="absolute top-6 left-0 right-0 h-0.5 bg-zinc-800 mx-16 md:mx-20"
          aria-hidden="true"
        >
          {/* Animated fill line */}
          <div className="h-full bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 animate-journey-line" />
        </div>

        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-col items-center text-center flex-1 relative z-10"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Step circle with icon */}
            <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center mb-3 transition-colors duration-300 group-hover:border-accent animate-step-in"
                 style={{ animationDelay: `${index * 150}ms` }}>
              <span className="text-accent">{step.icon}</span>
            </div>

            {/* Step number badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center md:hidden">
              {index + 1}
            </div>

            {/* Step title */}
            <h3 className="font-semibold text-white mb-1">{step.title}</h3>

            {/* Step description - hidden on mobile */}
            <p className="text-sm text-zinc-400 max-w-[150px] hidden sm:block">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
