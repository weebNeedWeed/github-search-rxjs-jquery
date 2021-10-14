import * as rxjs from "rxjs";
import * as $ from "jquery";
import "./all.css";
import repoIcon from "../assets/repository.png";
import starIcon from "../assets/star.png";
import codeIcon from "../assets/coding.png";
import branchIcon from "../assets/branch.png";

const input = $("#input");
const select = $("#select");
const repoList = $("#list");
const reset = $("#reset");

function fetchRepo(data: string, perPage: number) {
	return new rxjs.Observable((observer: rxjs.Subscriber<any>) => {
		$.ajax({
			url: `https://api.github.com/search/repositories?q=${data}&page=1&per_page=${perPage}`,
			method: "get",
			dataType: "json",
			success: (data) => {
				observer.next(data);
			},
			error: (error: any) => {
				observer.error(error);
			},
		});
	});
}

rxjs
	.fromEvent(reset, "click")
	.pipe(rxjs.throttleTime(500))
	.subscribe(() => {
		repoList.html("");
		input.val("");
	});

rxjs
	.fromEvent(input, "keyup")
	.pipe(
		rxjs.map(() => input.val().toString().trim()),
		rxjs.filter((data: string) => Boolean(data)),
		rxjs.debounceTime(700),
		rxjs.distinctUntilChanged(),
		rxjs.switchMap((value: string) => fetchRepo(value, Number(select.val()))),
	)
	.subscribe((data: { items: Array<any> }) => {
		const { items } = data;
		repoList.html("");

		items.forEach((element: any, index: number) => {
			let html = `<div class="repo-item mb-4" id="${element.id}">
          <div class="repo-title-wrapper">
            <img src="${repoIcon}" style="margin-right: 10px;" class="mt-auto mb-auto" width="16"
              height="16" alt="gsearch star">
            <a class="repo-title mt-auto mb-auto" href="${element.html_url}" target="_blank">${element.full_name}</a>
          </div>

          <div>
            ${element.description}
          </div>

          <div class="d-flex justify-content-between">
            <div class="d-flex">
              <p style="border-right: 1px solid black;margin-right: 20px; padding-right: 20px;">
                ${element.stargazers_count}
                <img src="${starIcon}" alt="gsearch star">
              </p>
              <p>
                ${element.forks_count}
                <img src="${branchIcon}" alt="gsearch fork">
              </p>
            </div>
            <p>
              <img src="${codeIcon}" class="me-2" alt="gsearch language">
              ${element.language}
            </p>
          </div>
        </div>`;

			setTimeout(() => {
				repoList.append(html);
			}, 500 * index);
		});
	});
