import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ECNUOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://acm.ecnu.edu.cn/problem/*/', 'https://acm.ecnu.edu.cn/contest/*/problem/*/'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    if (elem.querySelector('a.active.item[href^="/contest/"]')) {
      const contest = elem.querySelector('.ui.header').textContent;

      task.setName(elem.querySelector('div.ui.header').textContent);
      task.setGroup(`ECNU Online Judge - ${contest}`);
    } else {
      task.setName(elem.querySelector('.ui.header').textContent);
      task.setGroup('ECNU Online Judge');
    }

    const limitsStr = elem.querySelector('.property').textContent;
    const limits = limitsStr.match(/([0-9.]+)/g);
    task.setTimeLimit(parseFloat(limits[0]) * 1000);
    task.setMemoryLimit(parseFloat(limits[1]));

    const blocks = elem.querySelectorAll('pre.sample-content');
    for (let i = 0; i < blocks.length; i += 2) {
      const input = blocks[i].textContent;
      const output = blocks[i + 1].textContent;

      task.addTest(input, output);
    }

    return task.build();
  }
}
