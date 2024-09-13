const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require("fs").promises

let goals = [];
let message = "Bem vindo ao Pocket Metas!\n";

async function loadGoalsData() {
  try {
    const data = await fs.readFile("goals.json", "utf-8");
    goals = JSON.parse(data);
  }
  catch (error) {
    goals = [];
  }
}

async function saveGoalsData() {
  await fs.writeFile("goals.json", JSON.stringify(goals, null, 2));
}

async function addNewGoal() {
  const newGoal = await input({
    message: "Digite uma meta: ",
    require
  });

  if (!newGoal) {
    message = "Nenhuma meta digitada.";
    return;
  }

  goals.push({
    value: newGoal,
    checked: false
  });

  message = "Meta cadastrada com sucesso.";
}

async function listGoals() {

  if (goals.length === 0) {
    message = "Nenhuma meta cadastrada.";
    return;
  }

  const response = await checkbox({
    message: "Utilize as setas para alterar as metas, espaço para marcar/desmarcar uma meta e Enter para prosseguir.",
    choices: [...goals],
    instructions: false
  });

  goals.forEach(goal => goal.checked = false);

  response.forEach((response) => {
    const goal = goals.find((goal) => goal.value === response);

    goal.checked = true;
  })

  message = "Meta(s) atualizada(s).";
}

async function listCompletedGoals() {
  const completedGoals = goals.filter((goal) => goal.checked);

  if (completedGoals.length === 0) {
    message = "Nenhuma meta realizada.";
    return;
  }

  await select({
    message: "Metas Realizadas: " + completedGoals.length,
    choices: [...completedGoals]
  });
}

async function listNotCompletedGoals() {
  const notCompletedGoals = goals.filter((goal) => !goal.checked);

  if (notCompletedGoals.length === 0) {
    message = "Nenhuma meta pendente.";
    return
  }

  await select({
    message: "Metas Pendentes: " + notCompletedGoals.length,
    choices: [...notCompletedGoals]
  });

}

async function removeGoal() {

  // Remover mais de uma meta //

  if (goals.length === 0) {
    message = "Nenhuma meta cadastrada.";
    return;
  }

  const goalsNotChecked = goals.map((goal) => {
    return {
      value: goal.value,
      checked: false
    }
  });

  const goalsToRemove = await checkbox({
    message: "Selecione a(s) meta(s) para remover, Enter para sair. ",
    choices: [...goalsNotChecked],
    instructions: false
  });

  if (goalsToRemove.length === 0) {
    message = "Nenhuma meta selecionada.";
    return
  }

  goalsToRemove.forEach((removedGoal) => {
    goals = goals.filter((goal) => {
      return goal.value !== removedGoal;
    });
  });

  message = "Meta(s) removida(s).";

  // Remover meta única //

  /*if (goals.length === 0) {
    message = "Nenhuma meta cadastrada.";
    return;
  }

  const response = await select({
    message: "Selecione a meta que deseja remover: ",
    choices: [...goals, "-Voltar"]
  });

  const removedGoal = goals.find((goal) => goal.value === response);

  goals = goals.filter((goal) => goal !== removedGoal);

  message = "Meta Removida.";
  */
}

function clearConsole() {
  console.clear();

  if (message !== "") {
    console.log(message);
    console.log("");
    message = "";
  }
}

async function start() {

  await loadGoalsData();

  while (true) {

    await saveGoalsData();
    clearConsole();

    const userOption = await select({
      message: "Selecione uma opção: ",
      choices: [
        {
          name: "- Adicionar Meta",
          value: "userNewGoal"
        },
        {
          name: "- Listar Metas",
          value: "userListGoals"
        },
        {
          name: "- Metas Realizadas",
          value: "userListCompleted"
        },
        {
          name: "- Metas Pendentes",
          value: "userListNotCompleted"
        },
        {
          name: "- Remover Meta",
          value: "userRemoveGoal"
        },
        {
          name: "Sair",
          value: "quit"
        },

      ]
    });

    switch (userOption) {
      case "userNewGoal":
        await addNewGoal();
        break
      case "userListGoals":
        await listGoals();
        break
      case "userListCompleted":
        await listCompletedGoals();
        break
      case "userListNotCompleted":
        await listNotCompletedGoals();
        break
      case "userRemoveGoal":
        await removeGoal();
        break
      case "quit":
        console.log("\nAté a próxima! :)\n");
        return
    }
  }
}

start();