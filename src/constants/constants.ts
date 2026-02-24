export const DAY_IN_MILLISECOND = 24 * 60 * 60 * 1000;
export const MINUTE_ON_MILLISECOND = 60 * 1000;
export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MEGABYTE_IN_BYTE = 1024 * 1024;

export enum EnvironmentEnum {
  dev = 'dev',
  prod = 'prod',
  test = 'test',
}

export enum RolesEnum {
  admin = 'admin',
  manager = 'manager',
  user = 'user',
}

export enum LeaveStatusEnum {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export enum LeaveTypeEnum {
  cp = 'cp',
  rtt = 'rtt',
  maladie = 'maladie',
  sans_solde = 'sans_solde',
  autre = 'autre',
}

export enum ExpenseStatusEnum {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  reimbursed = 'reimbursed',
}

export enum ExpenseTypeEnum {
  transport = 'transport',
  repas = 'repas',
  hebergement = 'hebergement',
  materiel = 'materiel',
  autre = 'autre',
}

export enum DocumentCategoryEnum {
  contrats = 'contrats',
  diplomes = 'diplomes',
  fiches_paie = 'fiches_paie',
  notes = 'notes',
  autre = 'autre',
}

export enum TokenEnum {
  access = 'access',
  refresh = 'refresh',
  reset = 'reset',
}
