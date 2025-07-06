import React, { useState } from "react";
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


  const mockServices = [
    { name: "Website", status: "operational" },
    { name: "API Gateway", status: "degraded" },
    { name: "Database", status: "operational" },
    { name: "Payment Service", status: "outage" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "outage":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4" />;
      case "outage":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

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

        {/* Simple Stats */}
        <div className="grid grid-cols-4 gap-8 mb-16 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-500">Services</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-500">Incidents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">24/7</div>
            <div className="text-sm text-gray-500">Monitoring</div>
          </div>
        </div>

        {/* Simple Demo */}
        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Live Preview
            </h2>
            <p className="text-gray-600">See how the status page works</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Service Status
              </h3>
              <span className="text-sm text-gray-500">
                Last updated: 2 min ago
              </span>
            </div>

            <div className="space-y-4">
              {mockServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex items-center space-x-2 ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {getStatusIcon(service.status)}
                      <span className="font-medium text-gray-900">
                        {service.name}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm capitalize ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {service.status === "outage"
                      ? "Major Outage"
                      : service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Real-time Updates
            </h3>
            <p className="text-gray-600">
              WebSocket integration for live status updates
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Team Management
            </h3>
            <p className="text-gray-600">
              Multi-tenant organizations with role-based access
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Github className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Open Source
            </h3>
            <p className="text-gray-600">
              Built with modern technologies and best practices
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["React", "Node.js", "WebSocket", "Tailwind", "Vercel"].map(
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
