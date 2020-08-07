import express from 'express';
const router = express.Router();
import { promises as fs } from 'fs';
import { send } from 'process';

const { readFile, writeFile, appendFile } = fs;

//1.Adição de novo array por parâmetros ao grades.json
router.post('/:student/:subject/:type/:value', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    let conc = {
      id: data.nextId++,
      student: req.params.student,
      subject: req.params.subject,
      type: req.params.type,
      value: parseFloat(req.params.value),
      timeStamp: new Date(),
    };
    data.grades.push(conc);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(conc);
  } catch (err) {
    console.log(err);
  }
});

//2.Update
router.put('/:id/:student/:subject/:type/:value', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    let conc = {
      id: parseInt(req.params.id),
      student: req.params.student,
      subject: req.params.subject,
      type: req.params.type,
      value: parseFloat(req.params.value),
      timeStamp: new Date(),
    };

    const index = data.grades.findIndex(
      (grade) => grade.id === parseInt(conc.id)
    );
    data.grades[index] = conc;
    //validação se ID existe
    if (conc.id < data.nextId) {
      await writeFile(global.fileName, JSON.stringify(data, null, 2));
      res.send(conc);
    } else {
      res.send('Id inexistente');
    }
  } catch (err) {
    console.log(err);
  }
});

//3.Delete by Id
router.delete('/:id', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
  } catch (err) {
    console.log(err);
  }
});

//4.Buscar grade pelo ID
router.get('/:id', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(grade);
  } catch (erro) {
    console.log(erro);
  }
});

//5.Consultar nota de aluno por disciplina

router.get('/:student/:subject', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const student = req.params.student;
    const subject = req.params.subject;

    const filter = await data.grades.filter(
      (grades) => grades.subject === subject && grades.student === student
    );
    const values = filter.reduce((accumulator, current) => {
      return accumulator + current.value;
    }, 0);

    res.send('a soma das notas é igual a ' + values);
  } catch (err) {
    console.log(err);
  }
});

//6.Consultar média por subject e type(alterei a rota)
router.get('/select/:subject/:type', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const subject = req.params.subject;
    const type = req.params.type;

    const filter = await data.grades.filter(
      (grades) => grades.subject === subject && grades.type === type
    );

    const soma = filter.reduce((accumulator, current) => {
      return accumulator + current.value;
    }, 0);

    const countElements = filter.length;

    const ready = getMedia(soma, countElements);

    function getMedia(num1, num2) {
      return num1 / num2;
    }

    res.send('a média é ' + JSON.stringify(ready));
  } catch (err) {
    console.log(err);
  }
});

//7.três melhores grades por subject e type(mexi na rota também)
router.get('/best/:subject/:type', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const subject = req.params.subject;
    const type = req.params.type;

    const filter = await data.grades.filter(
      (grades) => grades.subject === subject && grades.type === type
    );

    const order = await filter
      .sort((a, b) => {
        return b.value - a.value;
      })
      .slice(0, 3);

    res.send(JSON.stringify(order));
  } catch (err) {
    console.log(err);
  }
});

export default router;
