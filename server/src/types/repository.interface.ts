export interface IRepository<T> {
  findById(id: string): T | undefined;
  save(entity: T): void;
  delete(id: string): boolean;
  exists(id: string): boolean;
}
