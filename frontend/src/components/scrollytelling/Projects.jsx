import { motion } from 'framer-motion';

const projects = [
  {
    title: "Anvika Premium",
    description: "Luxury Indian ethnic wear crafted for the modern woman.",
    category: "E-Commerce",
    image: "/demo-saree.jpg"
  },
  {
    title: "The Saree Edit",
    description: "A digital experience celebrating the timeless drape.",
    category: "Lookbook",
    image: "/demo-saree.jpg"
  },
  {
    title: "Festive Flow",
    description: "Interactive campaign for the Diwali 2026 collection.",
    category: "Campaign",
    image: "/demo-saree.jpg"
  }
];

const Projects = () => {
  return (
    <section className="section-space px-4 sm:px-8 md:px-16 bg-[#121212] min-h-screen relative z-20">
      <div className="max-w-[90rem] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-light text-white tracking-tight">Featured Work</h2>
          <div className="w-16 h-[1px] bg-white/30 mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.2, ease: "easeOut" }}
              className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer hover:border-white/30 transition-colors duration-500"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-3 block">
                  {project.category}
                </span>
                <h3 className="text-2xl text-white font-light mb-3">{project.title}</h3>
                <p className="text-white/70 font-light text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
              
              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
