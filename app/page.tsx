import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      {/* Hero Section */}
      <header className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/tempo-logo.svg"
              alt="Tempo Logo"
              width={128}
              height={128}
              className="h-24 w-auto sm:h-32"
            />
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Better together
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              through understanding
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 sm:text-2xl">
            A couples communication tool that bridges the gap throughout the
            menstrual cycle. She shares, he understands, you both connect
            better.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#download"
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Download for iOS
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition hover:border-gray-400"
            >
              How it works
            </a>
          </div>
        </div>
      </header>

      {/* The Problem */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Communication, not surveillance
            </h2>
            <p className="mx-auto mb-12 max-w-3xl text-lg text-gray-600">
              Tempo isn&apos;t a period tracker for him to use behind her back.
              It&apos;s a tool you both use together — she shares how she&apos;s
              feeling, he gets context to show up better. Communication closes
              the gap.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-8">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                For Her
              </h3>
              <p className="text-gray-600">
                Quick daily check-ins: &quot;How am I feeling today?&quot;
                Simple mood tracking + binary period status. No complicated
                features.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-8">
              <div className="mb-4 text-4xl">🎯</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                For Him
              </h3>
              <p className="text-gray-600">
                Daily context cards with what&apos;s happening hormonally, plus
                enhanced insights when she shares her mood.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-8">
              <div className="mb-4 text-4xl">🤝</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                For Both
              </h3>
              <p className="text-gray-600">
                Set up together with personalized preferences. She controls
                what&apos;s shared. Privacy and consent built in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Set it up together. Check in daily.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Tempo isn&apos;t a tracker you use behind her back. It&apos;s a
              tool you set up together — so you&apos;re both on the same page.
            </p>
          </div>

          <div className="space-y-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                  Step 1
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Link your profiles with an invite code
                </h3>
                <p className="mb-4 text-lg text-gray-600">
                  One partner signs up and creates the couple profile, then
                  shares an invite code with their partner. Both join, both have
                  access, both decide what gets shared.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-600">✓</span>
                    <span>Takes 5 minutes, done together</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-600">✓</span>
                    <span>She controls cycle tracking (opt-in)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-600">✓</span>
                    <span>Both see different views for their role</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-1">
                <div className="rounded-xl bg-white p-8">
                  <div className="space-y-4 text-gray-700">
                    <div className="font-semibold">Onboarding Preview:</div>
                    <div className="text-sm">
                      &quot;What helps during your period?&quot;
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm">
                      - Heat pack without asking
                      <br />
                      - Handle dinner
                      <br />- Just check in, don&apos;t hover
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                  <div className="rounded-xl bg-white p-8">
                    <div className="mb-2 text-sm font-semibold text-purple-700">
                      Follicular Phase - Day 8
                    </div>
                    <div className="mb-4 text-xl font-bold text-gray-900">
                      Energy is rising
                    </div>
                    <div className="mb-4 text-sm text-gray-600">
                      Estrogen is increasing. She&apos;s likely feeling
                      motivated and social.
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
                        Smart move today
                      </div>
                      <div className="text-sm text-gray-700">
                        Good time for deeper conversations or planning together
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
                  Step 2
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  She checks in, he gets context
                </h3>
                <p className="mb-4 text-lg text-gray-600">
                  She taps her mood and period status in seconds. He gets a
                  daily context card—plus enhanced guidance when she shares how
                  she&apos;s feeling.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-purple-600">✓</span>
                    <span>Her: Quick mood + period check-ins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-purple-600">✓</span>
                    <span>Him: Daily cards with smart moves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-purple-600">✓</span>
                    <span>Enhanced cards when moods are shared</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              What&apos;s in each daily card
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border-2 border-gray-200 p-6">
              <div className="mb-3 text-3xl">📅</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Current phase
              </h3>
              <p className="text-sm text-gray-600">
                Menstrual, follicular, ovulation, or luteal — and what day
                she&apos;s on
              </p>
            </div>

            <div className="rounded-xl border-2 border-gray-200 p-6">
              <div className="mb-3 text-3xl">🧬</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                What&apos;s happening
              </h3>
              <p className="text-sm text-gray-600">
                A clear explanation of the hormonal shifts and what they affect
              </p>
            </div>

            <div className="rounded-xl border-2 border-gray-200 p-6">
              <div className="mb-3 text-3xl">⚠️</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Common misreads
              </h3>
              <p className="text-sm text-gray-600">
                What might seem like it&apos;s about you — but probably
                isn&apos;t
              </p>
            </div>

            <div className="rounded-xl border-2 border-gray-200 p-6">
              <div className="mb-3 text-3xl">💡</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Smart move
              </h3>
              <p className="text-sm text-gray-600">
                One specific, practical thing you can do today to show up well
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Science-Based */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Science-based. Not stereotypes.
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Tempo is built on research about the menstrual cycle and how
            hormones affect mood, energy, and perception. It&apos;s not about
            generalizations — it&apos;s about understanding real biological
            patterns so you can respond with empathy, not assumption.
          </p>
          <a
            href="#learn"
            className="inline-block rounded-full border-2 border-white px-8 py-3 font-semibold transition hover:bg-white hover:text-purple-600"
          >
            Learn the science
          </a>
        </div>
      </section>

      {/* CTA */}
      <section id="download" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Better together starts with better understanding
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Download Tempo and link your profiles together in under 5 minutes.
            Communication built for couples.
          </p>
          <a
            href="#download"
            // className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Download for iOS
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Android version coming soon
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 Tempo. Built for better understanding.</p>
        </div>
      </footer>
    </div>
  );
}
