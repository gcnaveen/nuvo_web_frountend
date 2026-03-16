/**
 * Build staff-request payload from form data and uploaded media IDs.
 * Use this shape for POST api/staff-requests after uploading images to S3/media.
 * All images come from "Upload your images"; first image is also sent as profilePhoto if the API expects it.
 *
 * @param {Object} data - react-hook-form values
 * @param {string[]} imageIds - array of media IDs from "Upload your images" (all profiles)
 * @param {string} otherExperienceText - text when "Other" experience is selected
 */
export function buildStaffRequestPayload(data, imageIds = [], otherExperienceText = "") {
  const languages = [];
  for (let i = 1; i <= 4; i++) {
    const name = data[`language${i}`];
    const proficiency = data[`rate${i}`];
    if (name && proficiency) {
      languages.push({ name, proficiency });
    }
  }

  let experienceAreas = data.experienceAreas || [];
  if (Array.isArray(experienceAreas)) {
    experienceAreas = experienceAreas.map((e) => e.toLowerCase());
    if (experienceAreas.includes("other") && otherExperienceText.trim()) {
      experienceAreas = experienceAreas.filter((area) => area !== "other");
      experienceAreas.push(otherExperienceText.trim());
    } else if (experienceAreas.includes("other")) {
      experienceAreas = experienceAreas.filter((area) => area !== "other");
    }
  }

  const availability = {
    fullDay: data.workType === "full-time",
    partTime: data.workType === "part-time",
    both: data.workType === "both",
  };

  let dob = data.dob;
  if (dob && typeof dob === "object" && dob.toISOString) {
    dob = dob.toISOString();
  }

  let shoeSize = data.shoeSize;
  if (typeof shoeSize === "string" && shoeSize.match(/^\d+$/)) {
    shoeSize = parseInt(shoeSize, 10);
  }

  return {
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address,
    city: data.city,
    country: data.country,
    placeOfBirth: data.placeOfBirth,
    dob: dob || "",
    status: data.status,
    telephone: data.telephone,
    cellPhone: data.cellPhone,
    email: data.email,
    weight: data.weight,
    height: data.height,
    shoeSize: shoeSize ?? "",
    blazerSize: data.blazerSize,
    trouserSize: data.trouserSize,
    student: data.student,
    school: data.school,
    degree: data.degree,
    languages,
    hostessExperience: data.hostessExperience,
    groupResponsible: data.groupResponsible,
    agency: data.agency,
    experienceAreas,
    workType: data.workType,
    holidayWork: data.holidayWork,
    profilePhoto: imageIds.length ? [imageIds[0]] : [],
    images: Array.isArray(imageIds) ? imageIds : [],
    availability,
  };
}
