import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotingOptimizedModule", (m) => {
  // Get the deployer's address as the initial voter
  const initialVoter = m.getParameter("initialVoter", "0x0000000000000000000000000000000000000001");

  const votingOptimized = m.contract("VotingOptimized", [initialVoter]);

  return { votingOptimized };
});
