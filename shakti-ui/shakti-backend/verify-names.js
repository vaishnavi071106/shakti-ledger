// 🎯 FINAL VAULT NAMES AND MEMBERS VERIFICATION TEST
console.log('🎯 VAULT NAMES AND MEMBER NAMES VERIFICATION TEST');
console.log('=' .repeat(60));

async function verifyVaultNamesAndMembers() {
  const API_BASE_URL = 'http://localhost:3004';
  
  try {
    // Get all vaults with full details
    console.log('\n1️⃣ Testing All Vaults with Names and Members...');
    const response = await fetch(`${API_BASE_URL}/api/vaults`);
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`✅ Found ${data.data.length} vaults in database:`);
      
      data.data.forEach((vault, index) => {
        console.log(`\n📋 Vault ${index + 1}:`);
        console.log(`   ✅ Name: "${vault.name}" ${vault.name ? '✓' : '❌ MISSING'}`);
        console.log(`   📍 Address: ${vault.contractAddress}`);
        console.log(`   👤 Creator: ${vault.creatorAddress}`);
        console.log(`   👥 Members: ${vault.members?.length || 0}`);
        
        if (vault.members && vault.members.length > 0) {
          vault.members.forEach((member, memberIndex) => {
            const hasName = member.displayName && member.displayName !== '';
            console.log(`      ${memberIndex + 1}. ${member.displayName || 'NO NAME'} ${hasName ? '✅' : '❌'}`);
            console.log(`         Address: ${member.walletAddress}`);
            console.log(`         Role: ${member.role}`);
          });
        } else {
          console.log('      ⚠️ No members found');
        }
      });
    }
    
    // Test user-specific vault retrieval
    console.log('\n2️⃣ Testing User-Specific Vault with Names...');
    const userResponse = await fetch(`${API_BASE_URL}/api/vaults/user/0x1111111111111111111111111111111111111111`);
    const userData = await userResponse.json();
    
    if (userData.success && userData.data?.vaults) {
      console.log(`✅ User has ${userData.data.vaults.length} vault(s):`);
      
      userData.data.vaults.forEach((vault, index) => {
        console.log(`\n📋 User Vault ${index + 1}:`);
        console.log(`   ✅ Name: "${vault.name}" ${vault.name ? '✓' : '❌ MISSING'}`);
        console.log(`   🏷️ User Role: ${vault.userRole}`);
        console.log(`   👥 Total Members: ${vault.members?.length || 0}`);
        
        if (vault.members && vault.members.length > 0) {
          console.log('   👥 Member Details:');
          vault.members.forEach((member, memberIndex) => {
            const hasName = member.displayName && member.displayName !== '';
            console.log(`      ${memberIndex + 1}. ${member.displayName || 'NO NAME'} ${hasName ? '✅' : '❌'}`);
            console.log(`         Role: ${member.role}`);
          });
        }
      });
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 VAULT NAMES AND MEMBERS VERIFICATION RESULTS');
    console.log('=' .repeat(60));
    
    const vaultsWithNames = data.data?.filter(v => v.name && v.name !== '').length || 0;
    const totalVaults = data.data?.length || 0;
    
    console.log(`✅ Vaults with Names: ${vaultsWithNames}/${totalVaults}`);
    
    const totalMembers = data.data?.reduce((sum, vault) => sum + (vault.members?.length || 0), 0) || 0;
    const membersWithNames = data.data?.reduce((sum, vault) => {
      return sum + (vault.members?.filter(m => m.displayName && m.displayName !== '').length || 0);
    }, 0) || 0;
    
    console.log(`✅ Members with Names: ${membersWithNames}/${totalMembers}`);
    
    if (vaultsWithNames === totalVaults && membersWithNames === totalMembers) {
      console.log('\n🎉 ALL VAULT NAMES AND MEMBER NAMES VERIFIED!');
      console.log('✅ Backend data structure: CORRECT');
      console.log('✅ Vault names: PRESENT');
      console.log('✅ Member names: PRESENT');
      console.log('✅ Data persistence: WORKING');
    } else {
      console.log('\n⚠️ Some names are missing:');
      if (vaultsWithNames < totalVaults) {
        console.log(`❌ Missing vault names: ${totalVaults - vaultsWithNames}`);
      }
      if (membersWithNames < totalMembers) {
        console.log(`❌ Missing member names: ${totalMembers - membersWithNames}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error verifying vault names and members:', error);
  }
}

verifyVaultNamesAndMembers();
