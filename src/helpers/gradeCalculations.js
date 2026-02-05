/**
 * Grade Calculation Helpers
 * Functions for computing weighted averages, summaries, and trends
 */
const Grade = require('../models/Grade');
const GradeType = require('../models/GradeType');
const GradingScale = require('../models/GradingScale');

/**
 * Calculate weighted average for a student in a subject
 * @param {ObjectId} tenantId
 * @param {ObjectId} studentId
 * @param {ObjectId} subjectId
 * @param {ObjectId} [termId] - Optional term filter
 * @returns {Object} { weightedAverage, letterGrade, breakdown }
 */
const calculateStudentSubjectAverage = async (tenantId, studentId, subjectId, termId = null) => {
    const query = {
        tenantId,
        studentId,
        subjectId,
        deleted: false,
        isPublished: true,
    };
    if (termId) query.termId = termId;

    const grades = await Grade.find(query).populate('gradeTypeId', 'name weight');

    if (grades.length === 0) {
        return { weightedAverage: null, letterGrade: null, breakdown: [] };
    }

    // Group grades by type
    const byType = {};
    for (const grade of grades) {
        const typeId = grade.gradeTypeId._id.toString();
        if (!byType[typeId]) {
            byType[typeId] = {
                gradeTypeId: grade.gradeTypeId._id,
                gradeTypeName: grade.gradeTypeId.name,
                weight: grade.gradeTypeId.weight || 0,
                scores: [],
            };
        }
        byType[typeId].scores.push(grade.percentage);
    }

    // Calculate average per type and weighted total
    let totalWeight = 0;
    let weightedSum = 0;
    const breakdown = [];

    for (const typeId of Object.keys(byType)) {
        const typeData = byType[typeId];
        const avg = typeData.scores.reduce((a, b) => a + b, 0) / typeData.scores.length;

        breakdown.push({
            gradeTypeId: typeData.gradeTypeId,
            gradeTypeName: typeData.gradeTypeName,
            count: typeData.scores.length,
            averagePercentage: Math.round(avg * 100) / 100,
            weight: typeData.weight,
        });

        if (typeData.weight > 0) {
            weightedSum += avg * typeData.weight;
            totalWeight += typeData.weight;
        }
    }

    // If no weights defined, use simple average
    let weightedAverage;
    if (totalWeight === 0) {
        const allScores = grades.map(g => g.percentage);
        weightedAverage = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    } else {
        weightedAverage = weightedSum / totalWeight;
    }

    weightedAverage = Math.round(weightedAverage * 100) / 100;

    // Get letter grade
    let letterGrade = null;
    const scale = await GradingScale.findOne({ tenantId });
    if (scale) {
        letterGrade = scale.getLetterGrade(weightedAverage);
    }

    return { weightedAverage, letterGrade, breakdown };
};

/**
 * Calculate grade summary for a student across all subjects
 * @param {ObjectId} tenantId
 * @param {ObjectId} studentId
 * @param {ObjectId} [termId]
 * @returns {Object} { subjects: [...], overallAverage, overallGPA }
 */
const calculateStudentSummary = async (tenantId, studentId, termId = null) => {
    const query = {
        tenantId,
        studentId,
        deleted: false,
        isPublished: true,
    };
    if (termId) query.termId = termId;

    const grades = await Grade.find(query)
        .populate('subjectId', 'name')
        .populate('gradeTypeId', 'name weight');

    if (grades.length === 0) {
        return { subjects: [], overallAverage: null, overallGPA: null };
    }

    // Group by subject
    const bySubject = {};
    for (const grade of grades) {
        const subjectId = grade.subjectId._id.toString();
        if (!bySubject[subjectId]) {
            bySubject[subjectId] = {
                subjectId: grade.subjectId._id,
                subjectName: grade.subjectId.name,
                grades: [],
            };
        }
        bySubject[subjectId].grades.push(grade);
    }

    const scale = await GradingScale.findOne({ tenantId });
    const subjects = [];
    let totalAvg = 0;
    let totalGPA = 0;
    let subjectCount = 0;

    for (const subjectId of Object.keys(bySubject)) {
        const subjectData = bySubject[subjectId];
        const result = await calculateStudentSubjectAverage(tenantId, studentId, subjectData.subjectId, termId);

        // Get GPA for this letter grade
        let gpa = null;
        if (scale && result.letterGrade) {
            const scaleEntry = scale.scales.find(s => s.letter === result.letterGrade);
            if (scaleEntry) gpa = scaleEntry.gpa;
        }

        subjects.push({
            subjectId: subjectData.subjectId,
            subjectName: subjectData.subjectName,
            gradeCount: subjectData.grades.length,
            weightedAverage: result.weightedAverage,
            letterGrade: result.letterGrade,
            gpa,
            breakdown: result.breakdown,
        });

        if (result.weightedAverage !== null) {
            totalAvg += result.weightedAverage;
            totalGPA += gpa || 0;
            subjectCount++;
        }
    }

    const overallAverage = subjectCount > 0 ? Math.round((totalAvg / subjectCount) * 100) / 100 : null;
    const overallGPA = subjectCount > 0 ? Math.round((totalGPA / subjectCount) * 100) / 100 : null;

    return { subjects, overallAverage, overallGPA };
};

/**
 * Calculate class average for a subject
 * @param {ObjectId} tenantId
 * @param {ObjectId} classId
 * @param {ObjectId} subjectId
 * @param {ObjectId} [termId]
 * @returns {Object} { classAverage, studentCount, distribution }
 */
const calculateClassSubjectAverage = async (tenantId, classId, subjectId, termId = null) => {
    const query = {
        tenantId,
        classId,
        subjectId,
        deleted: false,
    };
    if (termId) query.termId = termId;

    const grades = await Grade.find(query);

    if (grades.length === 0) {
        return { classAverage: null, studentCount: 0, distribution: {} };
    }

    // Group by student
    const byStudent = {};
    for (const grade of grades) {
        const studentId = grade.studentId.toString();
        if (!byStudent[studentId]) {
            byStudent[studentId] = [];
        }
        byStudent[studentId].push(grade.percentage);
    }

    // Calculate average per student
    const studentAverages = [];
    for (const studentId of Object.keys(byStudent)) {
        const scores = byStudent[studentId];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        studentAverages.push(avg);
    }

    const classAverage = studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length;

    // Grade distribution
    const scale = await GradingScale.findOne({ tenantId });
    const distribution = {};
    if (scale) {
        for (const avg of studentAverages) {
            const letter = scale.getLetterGrade(avg);
            distribution[letter] = (distribution[letter] || 0) + 1;
        }
    }

    return {
        classAverage: Math.round(classAverage * 100) / 100,
        studentCount: studentAverages.length,
        distribution,
    };
};

/**
 * Determine grade trend (improving, declining, stable)
 * @param {Array} grades - Array of grade objects sorted by date
 * @returns {String} 'improving' | 'declining' | 'stable'
 */
const calculateTrend = (grades) => {
    if (grades.length < 3) return 'stable';

    // Compare first half average to second half average
    const mid = Math.floor(grades.length / 2);
    const firstHalf = grades.slice(0, mid);
    const secondHalf = grades.slice(mid);

    const firstAvg = firstHalf.reduce((a, g) => a + g.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, g) => a + g.percentage, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
};

module.exports = {
    calculateStudentSubjectAverage,
    calculateStudentSummary,
    calculateClassSubjectAverage,
    calculateTrend,
};
