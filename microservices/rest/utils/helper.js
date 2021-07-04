
export default {
  calculateEloPoint: async (data) => {
    const eloA = data.eloA;
    const eloB = data.eloB;
    const goalA = data.goalA;
    const goalB = data.goalB;
    try {
      const G = 0;
      if (goalA - goalB == 1) G = 1;
      if (goalA - goalB == ) G = 2;
      return null
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
}