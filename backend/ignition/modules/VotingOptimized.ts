import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotingOptimizedModule", (m) => {
  // Get the deployer's address as the initial voter
  const initialVoter = m.getParameter("initialVoter", "0x0aa4fb3a1393e1bffa4a11139b38a3bfc581609d");

  const votingOptimized = m.contract("VotingOptimized", [initialVoter]);

  return { votingOptimized };
});
