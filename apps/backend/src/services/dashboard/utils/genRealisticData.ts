export const generateRealisticData = () => {
    const now = Date.now();
    const dataPoints = 48;
    const interval = 30 * 60 * 1000;

    const inferiorHistory = [];
    const superiorHistory = [];

    let consumo = 5;
    let bomba = 15;
    let entrada = 5;
    let inferiorLevel = 80;
    let superiorLevel = 50;
    let isEnchendendo = false;

    for (let i = dataPoints - 1; i >= 0; i--) {
        const timestamp = now - (i * interval);

        // Simula o sistema de bombeamento
        if (inferiorLevel < 80 && !isEnchendendo) inferiorLevel = Math.min(100, inferiorLevel + entrada);
        else if (inferiorLevel < 80 && isEnchendendo) inferiorLevel = Math.min(100, inferiorLevel + entrada - bomba);
        else if (inferiorLevel > 80 && isEnchendendo) inferiorLevel = Math.max(0, inferiorLevel - bomba);
        else inferiorLevel = Math.max(0, inferiorLevel);

        // Superior recebe água do inferior
        if (isEnchendendo) {
            superiorLevel = Math.min(100, superiorLevel + bomba);
        } else {
            superiorLevel = Math.max(0, superiorLevel - consumo);
        }

        if (superiorLevel < 20) isEnchendendo = true;
        if (superiorLevel > 90) isEnchendendo = false;

        // Adiciona variação aleatória pequena
        inferiorLevel += (Math.random() - 0.5) * 2;
        superiorLevel += (Math.random() - 0.5) * 1;

        // Garante que os valores estejam entre 0 e 100
        inferiorLevel = Math.max(0, Math.min(100, inferiorLevel));
        superiorLevel = Math.max(0, Math.min(100, superiorLevel));

        inferiorHistory.push({
            time: timestamp,
            value: Math.round(inferiorLevel)
        });

        superiorHistory.push({
            time: timestamp,
            value: Math.round(superiorLevel)
        });
    }

    return { inferiorHistory, superiorHistory };
};