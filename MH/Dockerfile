FROM node:20-alpine AS builder
WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile

# NEXT_PUBLIC_* phải có mặt lúc `next build` vì giá trị được inline vào bundle client.
# Không khai báo ARG/ENV ở đây thì process.env.NEXT_PUBLIC_API_HOST = undefined khi build.
ARG NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_API_HOST=$NEXT_PUBLIC_API_HOST
ARG NEXT_PUBLIC_MHGS_HOST
ENV NEXT_PUBLIC_MHGS_HOST=$NEXT_PUBLIC_MHGS_HOST

RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]