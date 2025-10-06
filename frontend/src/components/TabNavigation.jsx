import React from 'react'

const TabNavigation = ({ tabs, activeTab, onTabChange, className = '' }) => {
    return (
        <div className={`bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 ${className}`}>
            <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
              relative flex-1 px-6 py-4 text-sm font-semibold text-center transition-all duration-300 whitespace-nowrap
              ${activeTab === tab.id
                                ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-500'
                                : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                            }
              first:rounded-tl-2xl last:rounded-tr-2xl
            `}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            {tab.icon && <tab.icon size={18} />}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`
                  ml-2 px-2 py-1 text-xs font-bold rounded-full
                  ${activeTab === tab.id
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }
                `}>
                                    {tab.count}
                                </span>
                            )}
                        </div>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default TabNavigation