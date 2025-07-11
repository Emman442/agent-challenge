import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";

import { auditorWorkflow } from "./agents/smart-contract-auditor/auditor-workflow"; // This can be deleted later
import { agent } from "./agents/smart-contract-auditor/auditor-agent"; // Build your agent here

export const mastra = new Mastra({
	workflows: { auditorWorkflow }, // can be deleted later
	agents: { agent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
