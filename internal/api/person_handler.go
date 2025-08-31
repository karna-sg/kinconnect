package api

import (
	"families-linkedin/internal/models"
	"families-linkedin/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PersonHandler struct {
	familyService *service.FamilyService
}

func NewPersonHandler(familyService *service.FamilyService) *PersonHandler {
	return &PersonHandler{
		familyService: familyService,
	}
}

// GetPerson retrieves a person by ID
func (h *PersonHandler) GetPerson(c *gin.Context) {
	personID := c.Param("id")
	if personID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Person ID is required"})
		return
	}

	// For now, we'll use the family service to get family members and find the person
	// In a more complete implementation, we'd have a dedicated person service
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct person retrieval not implemented yet"})
}

// UpdatePerson updates an existing person
func (h *PersonHandler) UpdatePerson(c *gin.Context) {
	personID := c.Param("id")
	if personID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Person ID is required"})
		return
	}

	var person models.Person
	if err := c.ShouldBindJSON(&person); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	person.ID = personID

	// For now, return not implemented
	// In a complete implementation, we'd have person service update method
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Person update not implemented yet"})
}

// GetEligibleMatches finds eligible marriage matches for a person
func (h *PersonHandler) GetEligibleMatches(c *gin.Context) {
	personID := c.Param("id")
	if personID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Person ID is required"})
		return
	}

	maxDegree := 3 // default
	if degree := c.Query("max_degree"); degree != "" {
		if d, err := strconv.Atoi(degree); err == nil && d > 0 && d <= 4 {
			maxDegree = d
		}
	}

	limit := 20 // default
	if l := c.Query("limit"); l != "" {
		if lim, err := strconv.Atoi(l); err == nil && lim > 0 && lim <= 100 {
			limit = lim
		}
	}

	matches, err := h.familyService.GetEligibleMatches(c.Request.Context(), personID, maxDegree)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Apply limit
	if len(matches) > limit {
		matches = matches[:limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"person_id":   personID,
		"matches":     matches,
		"count":       len(matches),
		"max_degree":  maxDegree,
		"message":     "Eligible matches found successfully",
	})
}

// SearchEligiblePersons searches for eligible marriage candidates
func (h *PersonHandler) SearchEligiblePersons(c *gin.Context) {
	var criteria models.PersonSearchCriteria

	// Parse query parameters
	criteria.Gender = c.Query("gender")
	criteria.MaritalStatus = c.Query("marital_status")
	criteria.EligibleForMarriage = c.Query("eligible_for_marriage") == "true"
	criteria.Religion = c.Query("religion")

	if minAge := c.Query("min_age"); minAge != "" {
		if age, err := strconv.Atoi(minAge); err == nil {
			criteria.MinAge = age
		}
	}

	if maxAge := c.Query("max_age"); maxAge != "" {
		if age, err := strconv.Atoi(maxAge); err == nil {
			criteria.MaxAge = age
		}
	}

	if minIncome := c.Query("min_income"); minIncome != "" {
		if income, err := strconv.ParseInt(minIncome, 10, 64); err == nil {
			criteria.MinIncome = income
		}
	}

	if maxIncome := c.Query("max_income"); maxIncome != "" {
		if income, err := strconv.ParseInt(maxIncome, 10, 64); err == nil {
			criteria.MaxIncome = income
		}
	}

	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil {
			criteria.Limit = l
		}
	} else {
		criteria.Limit = 50 // default
	}

	if offset := c.Query("offset"); offset != "" {
		if o, err := strconv.Atoi(offset); err == nil {
			criteria.Offset = o
		}
	}

	// Parse array parameters
	if education := c.QueryArray("education"); len(education) > 0 {
		criteria.Education = education
	}

	if profession := c.QueryArray("profession"); len(profession) > 0 {
		criteria.Profession = profession
	}

	if location := c.QueryArray("location"); len(location) > 0 {
		criteria.Location = location
	}

	if caste := c.QueryArray("caste"); len(caste) > 0 {
		criteria.Caste = caste
	}

	// For now, return not implemented as we need PersonRepository integration
	c.JSON(http.StatusNotImplemented, gin.H{
		"error":    "Person search not fully implemented yet",
		"criteria": criteria,
		"message":  "This endpoint requires PersonRepository integration",
	})
}