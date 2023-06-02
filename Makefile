install:
	npm ci

lint:
	npx eslint

serve:
	npx webpack serve

startApp:
	npm ci \
	&& npm run build \
	&& npx webpack serve
