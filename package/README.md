## NUKU-API Library

A lightweight JavaScript/TypeScript library for retrieving stock market data using NUKU-API Rest API.

## Table of Contents

- [NUKU-API Library](#nuku-api-library)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Node.js](#nodejs)
  - [Browser](#browser)
- [Usage](#usage)
  - [Node.js/ES Modules](#nodejses-modules)
  - [Node.js/CommonJS](#nodejscommonjs)
  - [React](#react)
  - [Browser](#browser-1)
- [API Reference](#api-reference)
- [Building](#building)
- [Testing](#testing)
- [Versioning](#versioning)
- [Contributing](#contributing)
  - [Bug Reports and Feature Requests](#bug-reports-and-feature-requests)
- [Change Log](#change-log)
  - [v1.0.0](#v100)
- [License](#license)
- [Documentation](#documentation)
- [Support](#support)

## Installation

### Node.js
```bash
npm install @chrisaugu/nuku-api-lib
```

### Browser
```html
<script src="path-to-library/nuku-api.min.js"></script>
```

## Usage

### Node.js/ES Modules
```javascript
import NukuAPI from '@chrisaugu/nuku-api-lib';

// Get all stocks
NukuAPI.getStocks().then(console.log);
```

### Node.js/CommonJS
```javascript
const * as NukuAPI = require('@chrisaugu/nuku-api-lib');

// Get all stocks
NukuAPI.getStocks().then(console.log);
```

### React
```jsx
import React, { useEffect, useState } from 'react';
import * as NukuAPI from '@chrisaugu/nuku-api-lib';

function StockComponent() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    NukuAPI.getStocks().then(setStocks);
  }, []);

  return (
    <div>
      {stocks.map(stock => (
        <div key={stock.code}>{stock.code}: {stock.bid}</div>
      ))}
    </div>
  );
}
```

### Browser
```javascript
// After including the script tag
NukuAPI.getStocks().then(console.log);
```

## API Reference

Go to [API Documentation](https://nuku.zeabur.app/docs/)


## Building

To build the library from source:

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

This will generate minified JavaScript files in the `dist/` directory.

## Testing

To run the test suite:

```bash
# Install dependencies (if not already installed)
npm install

# Run tests
npm run test
```

## Versioning

This project follows [Semantic Versioning](http://semver.org/):
- **MAJOR** version for breaking changes
- **MINOR** version for new features (backward compatible)
- **PATCH** version for bug fixes

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Bug Reports and Feature Requests
Found a bug or have a feature request? [Please open a new issue](https://github.com/chrisaugu/pngx-api/issues).

## Change Log

### v1.0.0
- First documented release
- Basic stock data retrieval functionality
- TypeScript support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

For complete documentation, visit [http://chrisaugu.github.io/pngx-api/package/](http://chrisaugu.github.io/pngx-api/package/)

## Support

For support and questions:
- Open an issue on [GitHub](https://github.com/chrisaugu/pngx-api/issues)
- Check the [documentation](http://chrisaugu.github.io/pngx-api/package/)