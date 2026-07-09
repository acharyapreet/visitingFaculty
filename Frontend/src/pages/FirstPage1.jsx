import backgroundImage from '../assets/background.png';

export default function FirstPage1({ onProceed }) {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#eff3ff]">
      <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between border-b border-white/40 bg-white/80 px-4 py-3 text-[11px] font-semibold text-blue-700 backdrop-blur-sm sm:px-6 md:px-12">
        <p className="truncate pr-3">Unified Visiting Faculty Management, IIPS, DAVV</p>
        <a href="#" className="shrink-0 text-blue-700 hover:text-blue-800">
          Home
        </a>
      </header>

      <main
        className="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-20 sm:px-6 md:px-10"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.40), rgba(15,23,42,0.55)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.10),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(0,77,210,0.18),transparent_28%)]" />
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.04))]" />

        <section className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center rounded-[28px] border border-white/20 bg-white/10 px-5 py-10 text-center shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur-[2px] sm:px-8 sm:py-14 md:px-12">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#004DD2] text-white shadow-lg shadow-[#004DD2]/30 sm:h-20 sm:w-20">
            <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>

          <h1 className="max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
            Welcome to International Institute of Professional Studies, DAVV
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:mt-5 md:text-base">
            A streamlined digital ecosystem for administrative management, appointment
            coordination, and academic collaboration with visiting faculty members.
          </p>

          <button
            type="button"
            onClick={onProceed}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#004DD2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#004DD2]/30 transition hover:bg-[#003bb3] sm:mt-10 sm:w-auto sm:px-8"
          >
            Click to Proceed
            <span aria-hidden="true">→</span>
          </button>
        </section>

        <footer className="absolute bottom-0 left-0 z-20 w-full border-t border-white/20 bg-white/85 px-4 py-4 backdrop-blur-sm sm:px-6 md:px-12">
          <p className="text-sm font-semibold text-slate-900">International Institute of Professional Studies</p>
          <p className="mt-1 text-xs text-slate-500">© 2026 All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
