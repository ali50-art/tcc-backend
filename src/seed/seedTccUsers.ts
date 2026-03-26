import 'dotenv/config';
import mongoose from 'mongoose';
import connection from '../database/mongodb/config';
import UserRepository from '../database/mongodb/repositories/user.repository';
import JwtHelper from '../utils/jwtHelper';
import { RolesEnum } from '../constants/constants';

type SeedUser = {
  matricule: string;
  name: string;
  role: RolesEnum;
  email: string;
};

const DEFAULT_PASSWORD = 'tcc@2026';

const USERS: SeedUser[] = [
  { matricule: '3', name: 'Gartfatta Gazzeh Mohamed', role: RolesEnum.admin, email: 'm.garfatta@tunisiacc.com' },
  { matricule: '1001', name: 'Eltaief Imen', role: RolesEnum.rh, email: 'i.ltaief@tunisiacc.com' },
  { matricule: '1184', name: 'Mzoughui Sameh', role: RolesEnum.employee, email: 's.mzoughui@tunisiacc.com' },
  { matricule: '1194', name: 'Drine Ali', role: RolesEnum.employee, email: 'a.drine@tunisiacc.com' },
  { matricule: '1187', name: 'Maghraoui Eya', role: RolesEnum.employee, email: 'e.maghraoui@tunisiacc.com' },
  { matricule: '1091', name: 'Jlizi Amal', role: RolesEnum.employee, email: 'a.jlizi@tunisiacc.com' },
  { matricule: '1003', name: 'Bchir Wissem', role: RolesEnum.employee, email: 'w.bchir@tunisiacc.com' },
  { matricule: '1180', name: 'Dallel Afef', role: RolesEnum.employee, email: 'a.dallel@tunisiacc.com' },
  { matricule: '1182', name: 'Fraj Sihem', role: RolesEnum.employee, email: 's.fraj@tunisiacc.com' },
  { matricule: '1186', name: 'Selmi Hanadi', role: RolesEnum.employee, email: 'h.selmi@tunisiacc.com' },
  { matricule: '1188', name: 'Rezgui Fériel', role: RolesEnum.employee, email: 'f.rezgui@tunisiacc.com' },
  { matricule: '1189', name: 'Rahal Sahar', role: RolesEnum.employee, email: 's.rahal@tunisiacc.com' },
  { matricule: '1190', name: 'Ayech Malek', role: RolesEnum.employee, email: 'm.ayech@tunisiacc.com' },
  { matricule: '1191', name: 'Majdoub Asma', role: RolesEnum.employee, email: 'a.majdoub@tunisiacc.com' },
  { matricule: '1192', name: 'Ben Alaya Chadhen', role: RolesEnum.employee, email: 'c.benalaya@tunisiacc.com' },
  { matricule: '1195', name: 'Chaari Walid', role: RolesEnum.employee, email: 'w.chaari@tunisiacc.com' },
  { matricule: '1196', name: 'Jegham Islem', role: RolesEnum.employee, email: 'i.jegham@tunisiacc.com' },
];

async function main() {
  await connection();

  const passwordHash = await JwtHelper.PasswordHashing(DEFAULT_PASSWORD);

  const results = [];
  for (const u of USERS) {
    const email = u.email.trim().toLowerCase();
    const existing = await UserRepository.getOneByQuery({ email });

    if (!existing) {
      const created = await UserRepository.create({
        name: u.name,
        email,
        role: u.role,
        matricule: u.matricule,
        password: passwordHash,
        isActive: true,
      });
      results.push({ action: 'created', email, id: created._id.toString() });
      continue;
    }

    await UserRepository.edit(existing._id, {
      name: u.name,
      role: u.role,
      matricule: u.matricule,
      password: passwordHash, // reset to the requested default password
      isActive: true,
    });
    results.push({ action: 'updated', email, id: existing._id.toString() });
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, count: results.length, results }, null, 2));
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

