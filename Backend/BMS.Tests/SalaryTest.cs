using Xunit;

namespace BMS.Tests;

public class SalaryTests
{
    [Fact]  //tells xunit that this is a test mthod
    public void Amount_ShouldBePositive()//xunit discovers method throw the test adapter
    {
        // Arrange
        decimal amount = 45000m;

        // Act
        bool isValid = amount > 0;

        // Assert
        Assert.True(isValid);  //condition suceeds so it returns true
    }
}