import { app, env } from "./app.js";
import { seedDefaultSpecialisations } from "./features/specialisations/specialisations.service.js";

const PORT = env.PORT || 5000;

const start = async () => {
  await seedDefaultSpecialisations();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
