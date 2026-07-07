import heroImage from '../assets/hero.png';

export default function FirstPage1() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-sm border border-slate-200 bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-[11px] font-semibold text-blue-700 md:px-6">
          <p>Unified Visiting Faculty Management, IIPS, DAVV</p>
          <a href="#" className="text-blue-700 hover:text-blue-800">
            Home
          </a>
        </header>

        <section
          className="relative flex min-h-[520px] items-center justify-center bg-cover bg-center px-6 py-14 md:min-h-[620px]"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-slate-950/58" />

          <div className="relative mx-auto max-w-3xl text-center text-white">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Welcome to International Institute of Professional Studies, DAVV
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-slate-200 md:text-base">
              A streamlined digital ecosystem for administrative management, appointment
              coordination, and academic collaboration with visiting faculty members.
            </p>

            <button
              type="button"
              className="mt-9 inline-flex items-center gap-2 rounded-md bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              Click to Proceed
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
          <p className="text-sm font-semibold text-slate-900">
            International Institute of Professional Studies
          </p>
          <p className="mt-1 text-xs text-slate-500">© 2026 All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
