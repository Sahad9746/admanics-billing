import transaction from './transaction'
import user from './user'
import client from './client'
import project from './project'
import wallet from './wallet'
import invoice from './invoice'
import transfer from './transfer'
import dailyWorkLog from './dailyWorkLog'
import metaAdsReport from './metaAdsReport'
import employeeProfile from './employeeProfile'
import advancePayment from './advancePayment'
import salaryRecord from './salaryRecord'

export const schemaTypes = [
  transaction, 
  user, 
  client, 
  project, 
  wallet, 
  invoice, 
  transfer, 
  dailyWorkLog, 
  metaAdsReport,
  employeeProfile,
  advancePayment,
  salaryRecord
]
