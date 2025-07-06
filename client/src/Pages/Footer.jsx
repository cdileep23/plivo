import { Activity, ExternalLink, Github } from 'lucide-react';
import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-6 h-6 text-gray-900" />
              <span className="text-lg font-medium text-gray-900">
                StatusBoard
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              A modern status page application built for the technical
              assignment. Monitor services, manage incidents, and keep your
              users informed.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Real-time Monitoring</li>
              <li>Team Management</li>
              <li>Incident Tracking</li>
              <li>Public Status Page</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  GitHub Repo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Live Demo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 StatusBoard. Built as a technical assignment showcase.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer