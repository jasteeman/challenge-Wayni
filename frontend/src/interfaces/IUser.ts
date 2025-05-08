
export interface IUser { 
    id?:string
    username: string
    nombre:string
    apellido:string
    password?: string 
    email: string
    servicio?:string
    rol?: string
    updatedAt?: Date
    createdAt?: Date
    enabled?: boolean
}