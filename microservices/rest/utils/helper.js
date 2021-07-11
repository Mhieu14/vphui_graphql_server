
export default {
  calculateEloPoint: (data) => {
    const eloA = parseInt(data.eloA);
    const eloB = parseInt(data.eloB);
    const goalA = parseInt(data.goalA);
    const goalB = parseInt(data.goalB);
    try {
      const diffGoal = Math.abs(goalA - goalB);
      const diffElo = Math.abs(eloA - eloB);
      
      // G
      const G = 0;
      if (diffGoal == 1) G = 1;
      else if (diffGoal == 1.5) G = 2;
      else G = (11 + diffGoal)/8 

      // W0
      const W0 = 1/(Math.pow(10, (-diffElo/400)) + 1)

      // W
      let W;
      if (goalA > goalB) W = 1;
      else if (goalA == goalB) W = 0.5;
      else W = 0;

      // P
      const P = parseInt(G * (W - W0)) 

      return [eloA + P, eloB - P]
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
}