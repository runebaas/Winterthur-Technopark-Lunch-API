# Winterthur Technopark Lunch API

This project was created out of my laziness to visit every canteen website around my office to see what they have for lunch. (Also as an excuse to play with some cool tech)

The API I created goes to their websites, gets their menus, parses them and makes them available via an api. There is [a simple frontend](https://gitlab.com/dbgit/websites/wtr-lunch/wtr-lunch-frontend) to see all menus on the same page. 

## Tech

* Typescript
* Rust
* wasm-pack
* AWS Lambda
* AWS SAM
* DynamoDB

## How to build

### Prerequisites

0. Install rust and the `wasm-unknown-unknown` toolchain
0. Install nodejs 12 or newer
0. Install yarn
0. Install docker (only for development)
0. Have valid aws credentials set on your pc (only for deployment)

### Building

**Dev**

Windows: `yarn start:windows`

Linux/macos `yarn start:unix`

**Prod**

`yarn build:prod`

**Deployment**

0. `yarn build:prod`
0. `yarn deploy`
