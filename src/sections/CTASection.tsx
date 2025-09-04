import React from 'react';

const CTASection = () => (
  <section className="py-20 px-4 text-center bg-gradient-to-r from-pink-100 via-blue-100 to-purple-100">
    <div className="container mx-auto max-w-2xl animate-fade-in">
      <h2 className="text-4xl font-bold mb-6 text-pink-700 animate-slide-up">Ready to Start Your Journey?</h2>
      <p className="text-lg text-gray-600 mb-8 animate-fade-in">
        Join thousands of students already advancing their tech careers with structured learning paths.
      </p>
      <a href="/auth">
        <button className="bg-pink-600 hover:bg-pink-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-200">
          Join Tech Student Hub
        </button>
      </a>
    </div>
  </section>
);

export default CTASection;
