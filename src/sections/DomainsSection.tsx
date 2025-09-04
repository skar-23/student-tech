import React from 'react';

const domains = [
  'Web Development',
  'Machine Learning',
  'Data Structures & Algorithms',
  'System Design',
  'DevOps',
  'Mobile Development',
];

const DomainsSection = () => (
  <section className="py-20 px-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
    <div className="container mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-purple-700 animate-slide-up">Popular Learning Domains</h2>
        <p className="text-lg text-gray-600 animate-fade-in">
          Choose your path and start learning today
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
        {domains.map((domain, i) => (
          <span key={i} className="bg-purple-200 text-purple-800 text-lg px-6 py-2 rounded-full shadow hover:bg-purple-300 transition-colors duration-200">
            {domain}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default DomainsSection;
