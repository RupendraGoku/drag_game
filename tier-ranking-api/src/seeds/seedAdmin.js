import bcrypt from 'bcrypt';
import { connectDatabase } from '../config/database.js';
import { env } from '../config/environment.js';
import { Admin } from '../models/Admin.js';

const run = async () => {
  await connectDatabase();

  for (const seedAdmin of env.seedAdmins) {
    const email = seedAdmin.email?.toLowerCase();
    if (!email || !seedAdmin.password) {
      console.log(`Skipping invalid admin seed entry: ${seedAdmin.email || 'missing email'}`);
      continue;
    }

    const existing = await Admin.findOne({ email });
    const passwordHash = await bcrypt.hash(seedAdmin.password, 12);

    if (existing) {
      existing.name = seedAdmin.name || existing.name || email;
      existing.passwordHash = passwordHash;
      existing.role = seedAdmin.role || existing.role || 'admin';
      existing.isActive = true;
      await existing.save();
      console.log(`Updated admin credentials: ${email}`);
      continue;
    }

    const admin = await Admin.create({
      name: seedAdmin.name || email,
      email,
      passwordHash,
      role: seedAdmin.role || 'admin',
      isActive: true
    });

    console.log(`Created admin: ${admin.email}`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
