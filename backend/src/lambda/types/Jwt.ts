import { JwtHeader } from 'jsonwebtoken'

export interface JwtToken {
  iss: string
  sub: string
  iat: number
  exp: number
}

export interface Jwt {
  header: JwtHeader
  payload: JwtToken
}