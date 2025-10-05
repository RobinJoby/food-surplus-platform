import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, Utensils, MapPin, Clock, Heart } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 to-violet-600 text-white py-20">

                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                                Reducing Food Waste,
                                <span className="block text-yellow-300">Feeding Communities</span>
                            </h1>
                            <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-90">
                                Connect excess food with those who need it most. Our platform brings together donors and beneficiaries to reduce waste and fight hunger.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 text-lg">
                                    Join Us Today
                                </Link>
                                <Link to="/login" className="btn border-2 border-white bg-transparent hover:bg-white/10 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 text-lg">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1">
                            <img
                                src="https://images.unsplash.com/photo-1607113761643-f4887c69ce50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Food donation"
                                className="rounded-xl shadow-2xl max-w-full h-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            How It Works
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Our platform connects food donors with beneficiaries through a simple and efficient process.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-xl mb-5">
                                <Utensils className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Donate Surplus Food</h3>
                            <p className="text-gray-600 mb-4">
                                Restaurants, grocery stores, and individuals can list their surplus food with just a few clicks.
                            </p>
                            <Link to="/register?type=donor" className="text-primary-600 font-medium inline-flex items-center hover:underline">
                                Register as Donor <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-xl mb-5">
                                <MapPin className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Find Available Food</h3>
                            <p className="text-gray-600 mb-4">
                                Beneficiaries can easily discover available food donations in their area using our interactive map.
                            </p>
                            <Link to="/register?type=beneficiary" className="text-primary-600 font-medium inline-flex items-center hover:underline">
                                Register as Beneficiary <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-xl mb-5">
                                <Heart className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Make a Difference</h3>
                            <p className="text-gray-600 mb-4">
                                Each donation helps reduce food waste and provides meals to those who need it most in your community.
                            </p>
                            <Link to="/about" className="text-primary-600 font-medium inline-flex items-center hover:underline">
                                Learn More <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16 bg-gradient-to-r from-primary-600 to-violet-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">2,500+</div>
                            <div className="text-primary-100">Food Donations</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">150+</div>
                            <div className="text-primary-100">Active Donors</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">75+</div>
                            <div className="text-primary-100">Community Partners</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">10,000+</div>
                            <div className="text-primary-100">People Helped</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Success Stories
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            See how our platform is making a difference in communities.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <img
                                    src="/testimonial-1.svg"
                                    alt="Local Restaurant"
                                    className="h-14 w-14 rounded-full object-cover mr-4"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                    }}
                                />
                                <div>
                                    <h4 className="font-bold text-lg">Fresh Plate Restaurant</h4>
                                    <p className="text-gray-600">Food Donor</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">
                                "This platform has allowed us to reduce our food waste while helping local families in need. The process is quick and simple!"
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <img
                                    src="/testimonial-2.svg"
                                    alt="Community Center"
                                    className="h-14 w-14 rounded-full object-cover mr-4"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                    }}
                                />
                                <div>
                                    <h4 className="font-bold text-lg">Hope Community Center</h4>
                                    <p className="text-gray-600">Beneficiary</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">
                                "We've been able to serve 40% more meals to our community members thanks to the consistent donations we receive through this platform."
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <img
                                    src="/testimonial-3.svg"
                                    alt="Food Bank Volunteer"
                                    className="h-14 w-14 rounded-full object-cover mr-4"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                    }}
                                />
                                <div>
                                    <h4 className="font-bold text-lg">Sarah Johnson</h4>
                                    <p className="text-gray-600">Food Bank Volunteer</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">
                                "The mapping feature makes it easy to find donations nearby. We can plan our pick-ups efficiently and serve more people in our community."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-primary-700 text-white text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
                        Join our community today and help us reduce food waste while feeding those in need.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold shadow-md transition-all duration-300">
                            Sign Up Now
                        </Link>
                        <Link to="/login" className="btn border-2 border-white bg-transparent hover:bg-white/10 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300">
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Food Surplus Platform</h3>
                            <p className="text-gray-400 mb-4">
                                Connecting excess food with those who need it most in communities around the world.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 3.982-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-3.982-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">How It Works</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">Food Waste Statistics</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Food Safety Guidelines</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Donation Tips</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Partner Organizations</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Success Stories</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
                            <p className="text-gray-400 mb-4">Stay up to date with our latest news and updates.</p>
                            <form className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="px-4 py-2 rounded-lg bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8">
                        <p className="text-center text-gray-400">
                            &copy; {new Date().getFullYear()} Food Surplus Platform. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;