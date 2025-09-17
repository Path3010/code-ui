import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Code, Atom as ReactIcon, Terminal, Cpu, Plus } from "lucide-react";

type TemplateKey = "blank" | "react" | "node" | "python";

const TEMPLATES: Array<{
  id: TemplateKey;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}> = [
  { id: "blank", title: "Blank", description: "Start with an empty workspace.", icon: Plus },
  { id: "react", title: "React", description: "A minimal React app structure.", icon: ReactIcon },
  { id: "node", title: "Node.js", description: "Basic Node.js project.", icon: Terminal },
  { id: "python", title: "Python", description: "Simple Python starter.", icon: Cpu },
];

export default function Templates() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const createProject = useMutation(api.projects.createProject);
  const applyTemplate = useMutation(api.files.applyTemplate);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleUseTemplate = async (tpl: (typeof TEMPLATES)[number]) => {
    try {
      toast("Creating project...");
      const projectId = await createProject({
        name: `${tpl.title} Project`,
        description: `${tpl.title} starter created from template`,
        language: undefined,
        framework: tpl.id === "react" ? "react" : undefined,
      });

      await applyTemplate({ projectId, templateKey: tpl.id });
      toast.success("Project ready!");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create from template");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Choose a Template</h1>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigate("/dashboard")}>
            Skip
          </Button>
        </header>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TEMPLATES.map((tpl, idx) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors h-full flex flex-col">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <tpl.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-white">{tpl.title}</CardTitle>
                    <CardDescription className="text-gray-300">{tpl.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button className="w-full" onClick={() => handleUseTemplate(tpl)}>
                      Use this template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </div>
    </div>
  );
}
