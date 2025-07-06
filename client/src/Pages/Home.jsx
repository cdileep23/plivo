import React from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Github,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

const StatusPageHero = () => {


  

  return (
    <div className="min-h-screen bg-white">
      
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
         

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Status Page Application
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern status page application with real-time monitoring, team
            management, and incident tracking.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Link to="/services">
              <button className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                <span>View Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>


        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["React", "Node.js", "Socket io",  "Express" ,"Tailwind","Shadcn UI"].map(
              (tech, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPageHero;
