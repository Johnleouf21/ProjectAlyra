import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotingModule", (m) => {
  const voting = m.contract("Voting", [
    "0x0000000000000000000000000000000000000001"
  ], {value: 1_000_000_000_000_000n});

  return { voting };
});