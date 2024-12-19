RUN npm install

RUN npm i @vercel/analytics

CMD import { Analytics } from "@vercel/analytics/react"
