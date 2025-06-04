# FusionAI Web UI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 科技创造健康生活 - 生成式AI全面重塑多元医疗应用场景

**The default Web UI for [FusionAI](https://www.fusiontech.cn/).**

FusionAI 是一个创新的医疗AI平台，依托泛行业AI大模型底座，辅助强大的工程化工具，实现AI预问诊、智能自诊、辅助诊疗、自动化生成病历文书、电子病历内涵质控、治疗方案制定等覆盖诊前、诊中、诊后全流程的应用场景闭环。

## Demo Video

- [View on YouTube](https://youtu.be/sZCHqrQBUGk)
- [Download Video](https://github.com/fusionai/fusionai/blob/main/assets/demo.mp4)

## Table of Contents
- [Quick Start](#quick-start)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Quick Start

### Prerequisites

- [FusionAI](https://www.fusiontech.cn/)
- Node.js (v22.14.0+)
- pnpm (v10.6.2+) as package manager

### Configuration

Create a `.env` file in the project root and configure the following environment variables:

- `NEXT_PUBLIC_API_URL`: The URL of the FusionAI API.

It's always a good idea to start with the given example file, and edit the `.env` file with your own values:

```bash
cp .env.example .env
```

### Installation

```bash
# Clone the repository
git clone https://github.com/fusionai/fusionai-web.git
cd fusionai-web

# Install dependencies
pnpm install

# Run the project in development mode
pnpm dev
```

Then open your browser and navigate to http://localhost:3000

Have fun!

## Contributing

We welcome contributions of all kinds! Whether you're fixing a typo, improving documentation, or adding a new feature, your help is appreciated. Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Special thanks to all the open source projects and contributors that make FusionAI possible. We stand on the shoulders of giants.
