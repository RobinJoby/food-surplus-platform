import React from 'react'

const DashboardHeader = ({
    title,
    subtitle,
    icon: Icon,
    iconGradient,
    stats
}) => {
    return (
        <div className="mb-8 animate-fade-in-up">
            <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
                {/* Header Section */}
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 ${iconGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">{title}</h1>
                            <p className="mt-1 text-gray-600 text-sm">{subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="p-6 pt-4">
                    <div className={`grid gap-4 ${stats.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${stat.bgGradient} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white border-opacity-30`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center shadow-md`}>
                                        <stat.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 opacity-90">{stat.label}</p>
                                        <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader