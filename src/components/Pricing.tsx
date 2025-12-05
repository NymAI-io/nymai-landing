export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For individual developers",
      features: ["VS Code Extension", "Chrome Extension", "Basic Regex Patterns", "Local Processing"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "/mo",
      description: "For power users & freelancers",
      features: ["Everything in Free", "Custom Regex Rules", "Sync Settings", "Priority Support"],
      cta: "Start Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "/mo",
      description: "For engineering teams",
      features: ["Everything in Pro", "Centralized Policy", "Audit Logs", "SSO Integration"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-zinc-400">
            Start for free, upgrade when you need more control.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative bg-zinc-950 border rounded-2xl p-8 flex flex-col ${plan.popular ? 'border-amber-500 shadow-2xl shadow-amber-900/10' : 'border-zinc-800'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                </div>
                <p className="text-zinc-400 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500 flex-shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular
                  ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
