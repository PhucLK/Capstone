import { decode } from 'jsonwebtoken'
import { APIGatewayProxyEvent } from "aws-lambda";

import { JwtToken } from '../types/Jwt'

function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken
  
  return decodedJwt.sub
}

export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}