import React from 'react'

const TabNavigation = ({ tabs, activeTab, onTabChange, className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            {/* Modern Tab Container with Enhanced Glassmorphism */}
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-2 overflow-hidden">
                {/* Enhanced Gradient Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/30 via-violet-500/30 via-pink-500/30 to-primary-500/30 p-[2px]">
                    <div className="rounded-3xl bg-white/90 backdrop-blur-2xl h-full w-full" />
                </div>

                {/* Animated Background Slider with Enhanced Gradient */}
                <div
                    className="absolute top-2 bottom-2 bg-gradient-to-r from-primary-500 via-violet-600 via-pink-500 to-primary-500 rounded-2xl shadow-xl transition-all duration-700 ease-out transform"
                    style={{
                        width: `calc(${100 / tabs.length}% - 4px)`,
                        left: `calc(${tabs.findIndex(tab => tab.id === activeTab) * (100 / tabs.length)}% + 2px)`,
                        transform: 'translateZ(0)', // Hardware acceleration
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 8s ease infinite'
                    }}
                />

                {/* Tab Buttons */}
                <div className="relative flex">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                relative flex-1 px-8 py-5 text-sm font-bold transition-all duration-700 ease-out
                                rounded-2xl flex items-center justify-center space-x-3 group
                                hover:scale-105 transform-gpu active:scale-95
                                ${activeTab === tab.id
                                    ? 'text-white shadow-2xl'
                                    : 'text-gray-700 hover:text-primary-600'
                                }
                            `}
                            style={{
                                zIndex: activeTab === tab.id ? 20 : 10
                            }}
                        >
                            {/* Icon with Enhanced Animation */}
                            <div className={`
                                transition-all duration-700 transform
                                ${activeTab === tab.id
                                    ? 'scale-125 rotate-6 drop-shadow-lg'
                                    : 'group-hover:scale-125 group-hover:-rotate-6 group-hover:drop-shadow-md'
                                }
                            `}>
                                {tab.icon && <tab.icon size={22} className={`
                                    ${activeTab === tab.id
                                        ? 'text-white drop-shadow-sm'
                                        : 'text-gray-600 group-hover:text-primary-500'
                                    }
                                `} />}
                            </div>

                            {/* Enhanced Label with Better Typography */}
                            <span className={`
                                font-bold tracking-wide text-sm leading-tight
                                ${activeTab === tab.id
                                    ? 'text-white drop-shadow-sm'
                                    : 'text-gray-700 group-hover:text-primary-600'
                                }
                                transition-all duration-500
                            `}>
                                {tab.label}
                            </span>

                            {/* Enhanced Count Badge with Glow Effect */}
                            {tab.count !== undefined && (
                                <div className={`
                                    relative inline-flex items-center justify-center min-w-[28px] h-7 px-3 text-xs font-black rounded-full transition-all duration-500
                                    ${activeTab === tab.id
                                        ? 'bg-white/30 text-white backdrop-blur-md border border-white/40 shadow-lg'
                                        : 'bg-gray-100 text-gray-700 group-hover:bg-primary-100 group-hover:text-primary-800 group-hover:scale-125 group-hover:shadow-md'
                                    }
                                `}>
                                    {tab.count}

                                    {/* Enhanced Pulse Animation */}
                                    {activeTab === tab.id && tab.count > 0 && (
                                        <>
                                            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping animation-delay-0" />
                                            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping animation-delay-150" />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Enhanced Hover Glow Effect */}
                            <div className={`
                                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-500
                                bg-gradient-to-r from-primary-500 via-violet-500 to-pink-500
                                ${activeTab === tab.id ? 'hidden' : ''}
                                blur-sm
                            `} />

                            {/* Micro-interactions: Ripple Effect */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                <div className={`
                                    absolute inset-0 bg-white/20 rounded-2xl transform scale-0 group-active:scale-100 
                                    transition-transform duration-300 ease-out
                                    ${activeTab === tab.id ? 'hidden' : ''}
                                `} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Enhanced Floating Shadow with Color */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-violet-500/20 via-pink-500/20 to-primary-500/20 rounded-3xl blur-2xl -z-10 scale-110 animate-pulse" />

            {/* Additional Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-300/10 via-violet-300/10 to-pink-300/10 rounded-3xl blur-3xl -z-20 scale-125" />

            {/* Keyframe Animations */}
            <style jsx>{`
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    25% { background-position: 100% 50%; }
                    50% { background-position: 100% 100%; }
                    75% { background-position: 0% 100%; }
                }
                
                .animation-delay-150 {
                    animation-delay: 150ms;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-2px); }
                }
                
                .group:hover {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

export default TabNavigation