import React from 'react';

class Home extends React.Component {
    render() {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Blockchain Ticketing App
                        </h2>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                            Secure, transparent, and efficient ticketing powered by blockchain technology
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900">Buy Tickets</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Purchase event tickets securely using cryptocurrency
                                </p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900">Verify Tickets</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Quick and easy ticket verification for event entry
                                </p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900">Manage Events</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Create and manage your events with blockchain security
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;