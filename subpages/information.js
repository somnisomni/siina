/*
 * Overall scripts for Information subpage
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

(() => {	
	const changelogJsonObject = JSON.parse(JSON_CHANGELOG);
	
	changelogJsonObject.forEach((v) => $q("#content #changelog #changelog_content_container").append(buildSingleChangelogItem(v)));

	$qa("a").forEach((e) => e.target = "_blank");
	$qa("#content #changelog .dev_changelog_title").forEach((e) => e.addEventListener("click", () => e.classList.toggle("open")));
	$q("#content #main #chrome_version").innerText = /Chrom.+\/(\d+\.\d+\.\d+\.\d+)/.exec(navigator.userAgent.split(" ").find((x) => /Chrom.+\/\d+\.\d+\.\d+\.\d+/.test(x)))[1] || "(Not on Chrome!)";
	$q("#content #main #version").innerText = new URLSearchParams(window.location.search).get("ver");
	
	function buildSingleChangelogItem(jsonObject) {
		const container = $ce("div");
		container.classList.add("changelog_version");
		
		/* Category Title */
		const title = $ce("h3");
		title.innerText = `${jsonObject["version_string"]} `;
		const titleSmall = $ce("small");
		titleSmall.innerText = `─ ${jsonObject["release_date"]}`;
		
		title.append(titleSmall);
		container.append(title);
		/* == */
		
		/* Changelog content */
		const mainUl = $ce("ul");
		jsonObject["changelogs"].forEach((v) => {
			const categoryTitleLi = $ce("li");
			if(v["dev_changelog"] == true) {
				categoryTitleLi.classList.add("dev_changelog_title");
				categoryTitleLi.innerText = "개발자용 세부 변경사항";
			} else {
				categoryTitleLi.innerText = v["title"];
			}
			mainUl.append(categoryTitleLi);
			
			if(v["content"]) {
				const categoryUl = $ce("ul");
				if(v["dev_changelog"] == true) categoryUl.classList.add("dev_changelog_content");
				v["content"].forEach((c) => {
					const itemLi = $ce("li");
					itemLi.innerHTML = c;
					
					categoryUl.append(itemLi);
				});
				mainUl.append(categoryUl);
			}
		});
		container.append(mainUl);
		/* == */
		
		return container;
	}
})();
