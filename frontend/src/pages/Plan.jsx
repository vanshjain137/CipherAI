import { ArrowLeft, Check, Crown, Sparkles, Zap } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { createPayment, verifyPayment } from '../features/payment.js'
import { useDispatch } from 'react-redux'
import { me } from '../features/me.js'
import { setUserData } from '../redux/userSlice.js'

const plans = [
    {
        key: "free",
        name: "Free",
        description: "For trying out the CipherAI IDE.",
        price: "₹0",
        period: "/month",
        credits: "100 AI credits",
        icon: Zap,
        features: [
            "100 AI credits",
            "AI code generation",
            "Project editor",
            "HTML / CSS / JS preview",
            "React preview",
            "Basic project management",
        ],
        button: "Current Plan",
        current: true,
    },
    {
        key: "pro",
        name: "Pro",
        description: "For developers who build regularly.",
        price: "₹299",
        period: "/month",
        credits: "500 AI credits",
        icon: Sparkles,
        popular: true,
        features: [
            "500 AI credits / month",
            "Everything in Free",
            "Priority AI generation",
            "Larger projects",
            "Unlimited projects",
            "Advanced AI coding",
            "Priority support",
        ],
        button: "Upgrade to Pro",
    },
    {
        key: "team",
        name: "Team",
        description: "For teams building products together.",
        price: "₹799",
        period: "/month",
        credits: "2,000 AI credits",
        icon: Crown,
        features: [
            "2,000 AI credits / month",
            "Everything in Pro",
            "Team collaboration",
            "Shared projects",
            "Higher Al limits",
            "Priority processing",
            "Team support",
        ],
        button: "Upgrade to Team",
    }
]

function Plan() {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handlePayment = async (plan) => {
        try {
            if (plan.key == "free" || plan.current) return;
            const data = await createPayment(plan.key)
            console.log(data)
            const options = {
                key: data.key_id,
                amount: data.order.amount,
                current: data.order.currency || "INR",
                name: "Cipher AI",
                description: `Plan ${plan.name}`,
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response
                        const data = await verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
                        if (data?.message === "Payment Verified") {
                            const freshUser = await me()
                            dispatch(setUserData(freshUser))
                            navigate("/")
                        } else {
                            console.error("Backend rejected payment:", data)
                        }
                    } catch (error) {
                        console.error("Handler Crash - Check your imports:", error)
                    }
                },
                theme: {
                    color: "#4f46e5"
                }
            }
            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='min-h-screen bg-slate-50 px-5 py-8 text-slate-900 dark:bg-[#07070c] dark:text-white'>
            <div className='pointer-events-none fixed left-1/2 top-0 h-125 w-175 -translate-x-1/2 rounded-full bg-indigo-500/8 blur-[140px]' />

            <div className='relative mx-auto max-w-6xl'>
                <div className='mb-12 flex items-center justify-between'>
                    <button
                        onClick={() => navigate(-1)}
                        className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/8 dark:bg-white/3 dark:text-slate-300 dark:hover:bg-white/6 cursor-pointer'
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <div className='text-sm font-semibold'>
                        Cipher AI
                    </div>
                </div>

                <div className='mx-auto mb-12 max-w-2xl text-center'>
                    <div className='mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300'>
                        <Sparkles size={13} />
                        Simple pricing for developers
                    </div>

                    <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>
                        Build more.
                        <span className='text-indigo-500'>
                            {" "}Ship faster.
                        </span>
                    </h1>

                    <p className='mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400'>
                        Choose a plan that gives you the AI credits
                        you need to build and iterate faster.
                    </p>
                </div>

                <div className='grid gap-5 md:grid-cols-3'>
                    {plans.map((plan, index) => {
                        const Icon = plan.icon
                        return (
                            <motion.div
                                key={plan.name}
                                initial={{
                                    opacity: 0,
                                    y: 20
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                transition={{
                                    delay: index * 0.08
                                }}
                                whileHover={{
                                    y: -4
                                }}
                                className={`relative flex flex-col rounded-2xl border p-6 transition ${plan.popular
                                    ? `border-indigo-500/40 bg-white shadow-xl shadow-indigo-500/10 dark:bg-white/5`
                                    : ` border-slate-200 bg-white/70 dark:border-white/8 dark:bg-white/2.5`
                                    }`}
                            >

                                {plan.popular && (
                                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white'>
                                        Most Popular
                                    </div>
                                )}

                                <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-white'>
                                    <Icon size={16} />
                                </div>
                                <h1 className='text-lg font-bold'>{plan.name}</h1>
                                <p className='mt-1 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400'>{plan.description}</p>
                                <div className='mt-5 flex items-end gap-1'>
                                    <span className='text-3xl font-bold tracking-tight'>{plan.price}</span>
                                    <span className='mb-1 text-xs text-slate-400'>{plan.period}</span>
                                </div>
                                <div className='mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:border-white/7 dark:bg-white/4 dark:text-slate-200'>
                                    <Zap
                                        size={14}
                                        className='text-indigo-500'
                                        fill='currentColor'
                                    />{plan.credits}
                                </div>

                                <button
                                    onClick={() => handlePayment(plan)}
                                    className={`mt-5 w-full rounded-lg py-2.5 text-xs font-semibold transition cursor-pointer ${plan.current
                                        ? `cursor-default bg-slate-100 text-slate-400 dark:bg-white/6 dark:text-slate-500`
                                        : plan.popular
                                            ? `bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500`
                                            : `bg-slate-900 text-white hover:opacity-90 dark:bg-white dark:text-slate-900`
                                        }`}>
                                    {plan.button}
                                </button>

                                <div className='mt-6 border-t border-slate-200 pt-5 dark:border-white/7'>
                                    <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Includes</p>
                                    <ul className='space-y-3'>
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className='flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300'
                                            >
                                                <Check size={14} className='mt-0.5 shrink-0 text-emerald-500' />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </motion.div>
                        )
                    })}
                </div>

                <div className='mt-10 text-center text-[11px] text-slate-400 dark:text-slate-600'>
                    Credits reset every month. Unused credits do not roll over.
                </div>



            </div>
        </div>
    )
}

export default Plan
