# loopback-base
Loopback app with mongodb, firebase, rest explorer

# Install

## 1.a. Install node dependencies

> This step is not optional

```bash
git clone https://github.com/Prozi/loopback-base
cd loopback-base
npm install
```

## 1.b. Create database

> This step is not optional

```bash
npm run migrate
```

## 1.c. Add firebase creditentials

> This enables firebase tracking and is optional

You should put your firebase creditentials from json:
> https://firebase.google.com/docs/auth/web/custom-auth#before-you-begin

inside project root: `firebase.creditentials.json`

# 2. Usage

```bash
npm start
```

