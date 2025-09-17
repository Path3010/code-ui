import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { 
  Code, 
  FileText, 
  Terminal, 
  GitBranch, 
  Search, 
  Zap,
  Users,
  Globe,
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Code,
      title: "Smart Code Editor",
      description: "Syntax highlighting, auto-completion, and intelligent code suggestions"
    },
    {
      icon: FileText,
      title: "File Explorer",
      description: "Organize your projects with an intuitive file and folder structure"
    },
    {
      icon: Terminal,
      title: "Integrated Terminal",
      description: "Run commands directly within the editor without switching windows"
    },
    {
      icon: GitBranch,
      title: "Git Integration",
      description: "Built-in version control with visual diff and merge tools"
    },
    {
      icon: Search,
      title: "Global Search",
      description: "Find and replace across all files with regex support"
    },
    {
      icon: Zap,
      title: "Extensions",
      description: "Extend functionality with a rich ecosystem of plugins"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeStudio
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
            <Button
              onClick={() => navigate(isAuthenticated ? "/templates" : "/auth")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              {isAuthenticated ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Choose Template
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Professional Code Editor</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            Code Like a
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent block">
              Professional
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience the power of VS Code in your browser. Build, debug, and deploy 
            your projects with our feature-rich online IDE that works anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/templates" : "/auth")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg"
            >
              {isAuthenticated ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Choose a Template
                </>
              ) : (
                <>
                  Start Coding Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <Globe className="h-5 w-5 mr-2" />
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-blue-400 mb-2">100K+</div>
            <div className="text-gray-300">Developers</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-purple-400 mb-2">1M+</div>
            <div className="text-gray-300">Projects Created</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
            <div className="text-gray-300">Uptime</div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">CodeStudio</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              Built with ❤️ by{" "}
              <a
                href="https://vly.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                vly.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}