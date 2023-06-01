export interface DatabaseConnection {
  query(command: any): Promise<any>
  close(): Promise<void>
}
